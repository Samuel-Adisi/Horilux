import logo from "@/assets/logo.png";

export default function LoadingSpinner({
  fullScreen = false,
  className = "",
}: {
  fullScreen?: boolean;
  className?: string;
}) {
  const spinner = (
    <img
      src={logo}
      alt="Loading"
      className={`h-20 w-20 object-contain [animation:horilux-fade_1.4s_ease-in-out_infinite] ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-24">{spinner}</div>;
}
