export const balloonColors: { [key: string]: string } = {
  // Basic colors
  purple: '#9c27b0',
  red: '#f44336',
  blue: '#2196f3',
  green: '#4caf50',
  yellow: '#ffeb3b',
  orange: '#ff9800',
  pink: '#e91e63',
  brown: '#795548',
  black: '#212121',
  white: '#fafafa',
  gray: '#9e9e9e',
  cyan: '#00bcd4',
  lime: '#cddc39',
  indigo: '#3f51b5',
  violet: '#9c27b0',
  magenta: '#e91e63',
  
  // Additional colors
  gold: '#ffd700',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  deeppink: '#ff1493',
  hotpink: '#ff69b4',
  lightpink: '#ffb6c1',
  palevioletred: '#db7093',
  plum: '#dda0dd',
  mediumseagreen: '#3cb371',
  mediumpurple: '#9370db',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  whitesmoke: '#f5f5f5',
  lightgray: '#d3d3d3',
  thistle: '#d8bfd8',
  powderblue: '#b0e0e6',
  lightcoral: '#f08080',
  khaki: '#f0e68c',
  seagreen: '#2e8b57',
  lightseagreen: '#20b2aa',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  dimgray: '#696969',
  dimgrey: '#696969',
  olive: '#808000',
  palegreen: '#98fb98',
  lightblue: '#add8e6',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  cadetblue: '#5f9ea0',
  darkblue: '#00008b',
  turquoise: '#40e0d0',
  teal: '#009688',
  navy: '#000080',
  fuchsia: '#f0f',
  aqua: '#0ff',
  azure: '#f0ffff',
  beige: '#f5f5dc',
};

export const statusColors = {
  pending: '#9e9e9e',
  readyForPickup: '#ff9800',
  pickedUp: '#2196f3',
  delivered: '#4caf50',
};

export const getBalloonColor = (color: string): string => {
  const normalizedColor = color.toLowerCase().trim();
  
  // First try exact match
  if (balloonColors[normalizedColor]) {
    return balloonColors[normalizedColor];
  }
  
  // Then try to find a matching color (for variations like "Light Blue" vs "light blue")
  const colorKey = Object.keys(balloonColors).find(key => 
    key.toLowerCase() === normalizedColor ||
    normalizedColor.includes(key.toLowerCase())
  );
  
  return colorKey ? balloonColors[colorKey] : '#9e9e9e'; // fallback to grey if color not found
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Pending':
      return statusColors.pending;
    case 'ReadyForPickup':
      return statusColors.readyForPickup;
    case 'PickedUp':
      return statusColors.pickedUp;
    case 'Delivered':
      return statusColors.delivered;
    default:
      return statusColors.pending;
  }
}; 