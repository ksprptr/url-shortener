/**
 * The drifting cyan blobs behind the public pages.
 **/
export default function DecorativeBackground() {
  return (
    <div className='pointer-events-none fixed inset-0 -z-10 overflow-hidden' aria-hidden>
      <div className='animate-float absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10' />
      <div className='animate-float-slow absolute top-40 -right-32 h-96 w-96 rounded-full bg-teal-200/25 blur-3xl dark:bg-cyan-600/10' />
      <div className='animate-float absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-sky-200/25 blur-3xl dark:bg-teal-500/10' />
    </div>
  );
}
