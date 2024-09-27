function KeepAwake() {
  return (
    <video
      loop
      controls
      autoPlay
      muted
      src="/muted-blank.mp4"
      className="opacity-0 fixed inset-0 pointer-events-none w-full h-full"
    ></video>
  );
}

export default KeepAwake;
