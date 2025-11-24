export interface ImagePlaceholder {
  id: string;
  imageUrl: string;
  imageHint: string;
  description: string;
}

export const PlaceHolderImages: ImagePlaceholder[] = [
  {
    id: 'oil-filter',
    imageUrl: 'https://images.unsplash.com/photo-1635784063683-13697429615d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2lsJTIwZmlsdGVyfGVufDB8fDB8fHww',
    imageHint: 'oil filter',
    description: 'Oil Filter'
  },
  {
    id: 'brake-pads',
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJha2UlMjBwYWRzfGVufDB8fDB8fHww',
    imageHint: 'brake pads',
    description: 'Brake Pads'
  },
  {
    id: 'tire',
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRpcmV8ZW58MHx8MHx8fDA%3D',
    imageHint: 'tire',
    description: 'Tire'
  },
  {
    id: 'chain-lube',
    imageUrl: 'https://images.unsplash.com/photo-1626128665085-483747621778?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW90b3JjeWNsZSUyMGNoYWlufGVufDB8fDB8fHww',
    imageHint: 'chain lube',
    description: 'Chain Lube'
  },
  {
    id: 'spark-plug',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1664302152990-5700398091f9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BhcmslMjBwbHVnfGVufDB8fDB8fHww',
    imageHint: 'spark plug',
    description: 'Spark Plug'
  },
  {
    id: 'battery',
    imageUrl: 'https://images.unsplash.com/photo-1619641086753-2136562a3c62?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyJTIwYmF0dGVyeXxlbnwwfHwwfHx8MA%3D%3D',
    imageHint: 'battery',
    description: 'Battery'
  }
];
