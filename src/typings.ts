export type Skill = string;
export type Skills = Skill[];

export type TS = string;

export type UserID = string;
export type UserName = string;

export type ChannelID = string;

export interface EmptySession {
  id: UserID;
  channel: ChannelID;
  name: string;
  last_updated: string;
  welcomed: boolean;
}

export interface Submission {
  location: string;
  description: string;
  skill: Skill;
}
export interface ActiveSession extends EmptySession {
  username: UserName;
  mentee_ts: TS;
  ts: TS;
  submission: Submission;
}
export interface ClaimedSession extends ActiveSession {
  group_id: ChannelID;
  mentor_claim_ts: TS;
  mentor: UserID;
  mentor_channel: ChannelID;
}

export type Session = EmptySession | ActiveSession | ClaimedSession;
export function isActive(session: Session): session is ActiveSession {
  // ts set last when transitioning empty -> active
  return typeof (session as ActiveSession).ts === "string";
}
export function isClaimed(session: Session): session is ClaimedSession {
  // mentor_claim_ts set last when transitioning active -> claimed
  return typeof (session as ClaimedSession).mentor_claim_ts === "string";
}
export function isEmpty(session: Session): session is EmptySession {
  return !isActive(session) && !isClaimed(session);
}

export class SessionCoerceError extends Error {
  constructor(type: string) {
    super(`Failed to coerce session object to type '${type}'`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export function coerceActive(
  session: Session,
  allowClaimed = false
): ActiveSession {
  if (isActive(session) && (allowClaimed || !isClaimed(session))) {
    return session;
  }
  throw new SessionCoerceError("active");
}
export function coerceClaimed(session: Session): ClaimedSession {
  if (isClaimed(session)) {
    return session;
  }
  throw new SessionCoerceError("claimed");
}
export function coerceEmpty(session: Session): EmptySession {
  if (isEmpty(session)) {
    return session;
  }
  throw new SessionCoerceError("empty");
}

export interface Mentor {
  skills: Skills;
}
