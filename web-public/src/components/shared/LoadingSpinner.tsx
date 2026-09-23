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
      className={`h-12 w-12 animate-pulse object-contain ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-16">{spinner}</div>;
}
