import { Post } from '../types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    author: {
      id: 'u2',
      name: 'Rahim Ahmed',
      email: 'rahim@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Rahim+Ahmed&background=0D9488&color=fff'
    },
    title: 'Hidden Gem: Sunset at the Bhairab River',
    content: 'Just discovered this amazing spot near the old bridge. The sunset view over the Bhairab river is absolutely mesmerizing. Highly recommend for evening walks!',
    type: 'blog',
    likes: 24,
    comments: [
      { id: 'c1', authorId: 'u3', authorName: 'Sarah K.', content: 'Is it safe to go there at night?', timestamp: '2h ago' }
    ],
    timestamp: '5h ago',
    tags: ['Nature', 'Relaxation']
  },
  {
    id: 'p2',
    author: {
      id: 'u3',
      name: 'Sarah Khan',
      email: 'sarah@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Khan&background=db2777&color=fff'
    },
    title: 'Best Kacchi Biryani in Town?',
    content: 'I tried the new place "Jashore Biryani House" near Doratana. The meat was tender, but the spice level was a bit low for me. Giving it a solid 4 stars.',
    type: 'review',
    rating: 4,
    location: 'Jashore Biryani House, Doratana',
    likes: 15,
    comments: [],
    timestamp: '1d ago',
    tags: ['Food', 'Dinner']
  },
  {
    id: 'p3',
    author: {
      id: 'u4',
      name: 'Tanvir Hasan',
      email: 'tanvir@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Tanvir+Hasan&background=2563eb&color=fff'
    },
    title: 'Best route to Benapole border?',
    content: 'Planning a trip to Kolkata next week. Is the road construction on the Jashore-Benapole highway finished? Or should I take the train?',
    type: 'discussion',
    likes: 8,
    comments: [
      { id: 'c2', authorId: 'u2', authorName: 'Rahim Ahmed', content: 'Train is much safer right now. The road is still dusty.', timestamp: '3h ago' }
    ],
    timestamp: '2d ago',
    tags: ['Travel', 'Transport']
  }
];