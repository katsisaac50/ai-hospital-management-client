// import { useRef, useEffect } from 'react';

// export const useDragScroll = () => {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const element = scrollRef.current;
//     if (!element) return;

//     let isDown = false;
//     let startX: number;
//     let scrollLeft: number;

//     const handleMouseDown = (e: MouseEvent) => {
//       isDown = true;
//       startX = e.pageX - element.offsetLeft;
//       scrollLeft = element.scrollLeft;
//       element.style.cursor = 'grabbing';
//       element.style.userSelect = 'none';
//     };

//     const handleMouseLeave = () => {
//       isDown = false;
//       element.style.cursor = 'grab';
//     };

//     const handleMouseUp = () => {
//       isDown = false;
//       element.style.cursor = 'grab';
//       element.style.userSelect = 'auto';
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//       if (!isDown) return;
//       e.preventDefault();
//       const x = e.pageX - element.offsetLeft;
//       const walk = (x - startX) * 2; // Scroll speed multiplier
//       element.scrollLeft = scrollLeft - walk;
//     };

//     // Touch events for mobile
//     const handleTouchStart = (e: TouchEvent) => {
//       isDown = true;
//       startX = e.touches[0].pageX - element.offsetLeft;
//       scrollLeft = element.scrollLeft;
//     };

//     const handleTouchEnd = () => {
//       isDown = false;
//     };

//     const handleTouchMove = (e: TouchEvent) => {
//       if (!isDown) return;
//       const x = e.touches[0].pageX - element.offsetLeft;
//       const walk = (x - startX) * 2;
//       element.scrollLeft = scrollLeft - walk;
//     };

//     // Add event listeners
//     element.addEventListener('mousedown', handleMouseDown);
//     element.addEventListener('mouseleave', handleMouseLeave);
//     element.addEventListener('mouseup', handleMouseUp);
//     element.addEventListener('mousemove', handleMouseMove);
    
//     // Touch events
//     element.addEventListener('touchstart', handleTouchStart);
//     element.addEventListener('touchend', handleTouchEnd);
//     element.addEventListener('touchmove', handleTouchMove);

//     // Cleanup
//     return () => {
//       element.removeEventListener('mousedown', handleMouseDown);
//       element.removeEventListener('mouseleave', handleMouseLeave);
//       element.removeEventListener('mouseup', handleMouseUp);
//       element.removeEventListener('mousemove', handleMouseMove);
//       element.removeEventListener('touchstart', handleTouchStart);
//       element.removeEventListener('touchend', handleTouchEnd);
//       element.removeEventListener('touchmove', handleTouchMove);
//     };
//   }, []);

//   return scrollRef;
// };