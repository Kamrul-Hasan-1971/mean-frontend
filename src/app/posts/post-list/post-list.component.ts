import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { AuthService } from "../../auth/auth.service";
import { ErrorService } from "src/app/error/error.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.scss"]
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  private errorSub: Subscription

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.subscribeError();
    this.isLoading = true;
    this.postsPerPage = parseInt(localStorage.getItem("postsPerPage")) || 2;
    this.currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.getAllPosts();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.subscribeAuthStatus();
  }

  getAllPosts(){
    this.postsSub = this.postsService
    .getPostsFetchedListener()
    .subscribe((postData: { posts: Post[]; postCount: number }) => {
      this.isLoading = false;
      this.totalPosts = postData.postCount;
      this.posts = postData.posts;
      for( let i = 0 ; i < this.posts.length; i++){
        this.posts[i].isImageLoading = true;
        this.loadImageAsync(this.posts[i]);
      }
    });
  }

  subscribeAuthStatus(){
    this.authStatusSub = this.authService
    .getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  subscribeError(){
    this.errorSub = this.errorService.getErrorListener().subscribe(err=>{
      this.isLoading = false;
    })
  }

  loadImageAsync(post: Post) {
    var downloadingImage = new Image();
    downloadingImage.onload = () => {
      const imgContainer: HTMLElement = document.getElementById(post.id) as HTMLElement;
      imgContainer.appendChild(downloadingImage);
      post.isImageLoading = false;
    };
    downloadingImage.onerror = (err) => {
      const imgContainer: HTMLElement = document.getElementById(post.id) as HTMLElement;
      imgContainer.innerText = "Error during loading image from server.";
      imgContainer.style.color = 'lightgray';
      imgContainer.style.fontWeight = "500";
      imgContainer.style.fontFamily = "Roboto";
      post.isImageLoading = false;
      console.error("Error during loading image from server, error", err, "vehicle details", post.imagePath);
    }
    downloadingImage.src = post.imagePath;
    downloadingImage.className = "post-image-img"
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    localStorage.setItem("postsPerPage",""+this.postsPerPage);
    localStorage.setItem("currentPage",""+this.currentPage);
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.errorSub.unsubscribe();
  }
}
