export interface ForumUser {
  id: number;
  userName: string;
  bio?: string | null;
  createdAt: string;
}

export interface ForumThread {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
  forumUserId: number;
  forumUser?: ForumUser;
}

export interface CreateForumUserRequest {
  userName: string;
  bio?: string;
}

export interface CreateForumThreadRequest {
  title: string;
  content: string;
  forumUserId: number;
}
