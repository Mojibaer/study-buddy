import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from 'study-buddy';

export function Single() {
  return (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/96?img=12" alt="Hassan Erfani" />
      <AvatarFallback>HE</AvatarFallback>
    </Avatar>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar size="sm">
        <AvatarImage src="https://i.pravatar.cc/96?img=5" alt="Marie Lang" />
        <AvatarFallback>ML</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="https://i.pravatar.cc/96?img=12" alt="Hassan Erfani" />
        <AvatarFallback>HE</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/96?img=8" alt="Jonas Pichler" />
        <AvatarFallback>JP</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function WithBadge() {
  return (
    <Avatar size="lg">
      <AvatarImage src="https://i.pravatar.cc/96?img=20" alt="Sofia Berger" />
      <AvatarFallback>SB</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  );
}

export function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/96?img=12" alt="Hassan Erfani" />
        <AvatarFallback>HE</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/96?img=5" alt="Marie Lang" />
        <AvatarFallback>ML</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/96?img=8" alt="Jonas Pichler" />
        <AvatarFallback>JP</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  );
}
