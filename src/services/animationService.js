import lottie from 'lottie-web';

const animations = {};

export async function loadAnimation(tag, path) {
  if (animations[tag]) {
    return animations[tag];
  }

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const animationData = await response.json();
  animations[tag] = animationData;
  return animationData;
}

export function getAnimation(tag) {
  return animations[tag];
}
export async function preloadAnimations(animationPaths) {
  for (const animation of animationPaths) {
    try {
      const response = await fetch(animation.path);
      const contentType = response.headers.get('content-type');

      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error(`HTTP error! Status: ${response.status}, Content-Type: ${contentType}`);
      }

      const animationData = await response.json();
      animations[animation.tag] = animationData;
    } catch (error) {
      throw error; // rethrow the error to stop further preloading
    }
  }
}
