function KeepAwake() {
  return (
    <video
      loop
      muted
      controls
      autoPlay
      src="/mute-blank.mp4"
      className="opacity-0 fixed inset-0 pointer-events-none w-full h-full"
    ></video>
  );
}

export default KeepAwake;
