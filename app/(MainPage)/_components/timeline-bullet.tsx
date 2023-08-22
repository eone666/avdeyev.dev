export interface TimelineBulletProps {
  present?: boolean;
}

export default function TimelineBullet({ present }: TimelineBulletProps) {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary outline outline-4 outline-background">
      {!present && <div className=" h-3 w-3 rounded-full bg-background" />}
    </div>
  );
}
