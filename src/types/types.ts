interface Reaction {
  likes: number;
  dislikes: number;
}

interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: Reaction;
  views: number;
  userId: number;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export type { Post, Reaction, User };
