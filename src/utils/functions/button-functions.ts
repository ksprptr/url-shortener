/**
 * Get the variant of the button
 */
export const getVariant = (variant: 'primary' | 'danger' | 'success') => {
  switch (variant) {
    case 'primary':
      return 'text-purple-800 bg-purple-600/15 hover:bg-purple-600/20';
      break;
    case 'danger':
      return 'text-red-800 bg-red-600/15 hover:bg-red-600/20';
      break;
    case 'success':
      return 'text-green-800 bg-green-600/15 hover:bg-green-600/20';
      break;
    default:
      break;
  }
};
