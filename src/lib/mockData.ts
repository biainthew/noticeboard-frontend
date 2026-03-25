export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  likes: number;
  comments: Comment[];
  liked?: boolean;
}

export const mockPosts: Post[] = [
{
  id: '1',
  title: 'Building Accessible Components in 2024',
  excerpt:
  'A deep dive into creating React components that work for everyone, focusing on ARIA patterns and keyboard navigation.',
  content:
  "Accessibility is no longer an afterthought in modern web development. When we build components, we must ensure they are usable by everyone, regardless of how they interact with the web.\n\nIn this post, we'll explore the core principles of building accessible React components. We'll start with semantic HTML, move on to managing focus, and finally discuss complex ARIA patterns for custom widgets like comboboxes and modals.\n\nRemember: Good accessibility is good design. It benefits all users, not just those with disabilities.",
  author: {
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    role: 'Frontend Engineer'
  },
  date: 'Oct 12, 2024',
  readTime: '5 min read',
  likes: 124,
  comments: [
  {
    id: 'c1',
    author: {
      name: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/150?u=alex'
    },
    content:
    "Great write-up! I've been struggling with focus trapping in modals, this really cleared things up.",
    date: 'Oct 12, 2024'
  },
  {
    id: 'c2',
    author: {
      name: 'Jordan Lee',
      avatar: 'https://i.pravatar.cc/150?u=jordan'
    },
    content:
    'Do you have any recommendations for testing accessibility in CI/CD pipelines?',
    date: 'Oct 13, 2024'
  }]

},
{
  id: '2',
  title: 'My Journey with TypeScript Generics',
  excerpt:
  'Demystifying TypeScript generics through real-world examples and practical use cases I encountered while building a design system.',
  content:
  "Generics can be intimidating when you first encounter them in TypeScript. They look like complex math equations mixed with code. But once you understand them, they unlock a whole new level of type safety and reusability.\n\nLet's break down how I learned to stop worrying and love the `<T>`. We'll look at building a generic API response handler, a flexible table component, and some utility types that will make your life easier.",
  author: {
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    role: 'Tech Lead'
  },
  date: 'Oct 10, 2024',
  readTime: '8 min read',
  likes: 89,
  comments: [
  {
    id: 'c3',
    author: {
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?u=emma'
    },
    content:
    'The API response example is exactly what I needed for my current project. Thanks Marcus!',
    date: 'Oct 11, 2024'
  }]

},
{
  id: '3',
  title: 'The State of CSS-in-JS',
  excerpt:
  'Evaluating the modern landscape of styling solutions in React, from Tailwind to zero-runtime CSS-in-JS libraries.',
  content:
  "The way we style React applications has evolved dramatically over the last few years. We've gone from global CSS to CSS Modules, to runtime CSS-in-JS, and now we're seeing a shift towards utility classes and zero-runtime solutions.\n\nIn this article, I compare Tailwind CSS, Vanilla Extract, and Panda CSS, looking at developer experience, performance, and maintainability.",
  author: {
    name: 'Priya Patel',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    role: 'UI Designer'
  },
  date: 'Oct 08, 2024',
  readTime: '6 min read',
  likes: 256,
  comments: []
},
{
  id: '4',
  title: 'Designing for Empty States',
  excerpt:
  'Why empty states are crucial for user onboarding and how to design them effectively.',
  content:
  "An empty state is what a user sees when there is no data to display. It's an often-overlooked part of the user experience, but it's a critical moment. It's an opportunity to educate, guide, and delight the user.\n\nInstead of just showing 'No items found', we should use this space to explain what the feature does, why it's valuable, and how the user can get started.",
  author: {
    name: 'David Kim',
    avatar: 'https://i.pravatar.cc/150?u=david',
    role: 'Product Designer'
  },
  date: 'Oct 05, 2024',
  readTime: '4 min read',
  likes: 142,
  comments: [
  {
    id: 'c4',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah'
    },
    content:
    'So true! Empty states are the perfect place for microcopy that adds personality to the app.',
    date: 'Oct 06, 2024'
  }]

}];