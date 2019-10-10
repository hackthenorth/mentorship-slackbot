/* eslint-disable @typescript-eslint/ban-ts-ignore */
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import {
  Session,
  UserID,
  TS,
  Mentor,
  Skills,
  isActive,
  isClaimed,
  ActiveSession
} from "typings";

const adapter = new FileSync("storage/db.json");
const db = low(adapter);

if (db.get("sessions").value() == null) {
  db.set("sessions", {}).write();
}

export const getSession = (user: UserID): Session =>
  db
    .get("sessions")
    // @ts-ignore
    .get(user)
    .value();

export const getSessionsToBump = () => {
  const sessions = db
    .get("sessions")
    // @ts-ignore
    .filter(
      (session: Session) =>
        isActive(session) &&
        !isClaimed(session) &&
        new Date(session.last_updated).getTime() <
          new Date().getTime() - 1000 * 60 * 10
    )
    .value();
  for (const session of sessions) {
    db.get("sessions")
      // @ts-ignore
      .get(session.id)
      .set("last_updated", new Date().toString())
      .write();
  }
  return sessions;
};

export const updateSession = (
  user: UserID,
  newSession: Partial<Session>
): Session => {
  const session = {
    ...(getSession(user) || {}),
    ...newSession,
    id: user,
    // eslint-disable-next-line @typescript-eslint/camelcase
    last_updated: new Date().toString()
  };
  return (
    db
      .get("sessions")
      .set(user, session)
      // @ts-ignore
      .write()[user]
  );
};

export const clearSession = (user: UserID) =>
  db
    .get("sessions")
    // @ts-ignore
    .get(user)
    .set("ts", undefined)
    .set("mentor", undefined)
    .set("mentor_claim_ts", undefined)
    .set("group_id", undefined)
    .write();

export const getUserIdByThreadTs = (threadTs: TS): UserID | undefined =>
  db
    .get("sessions")
    .findKey((session: ActiveSession) => session.ts === threadTs)
    .value();

export const getMentors = () => db.get("mentors").value() || {};

export const setMentors = (mentors: { [key: string]: Mentor }) =>
  db.set("mentors", mentors).write();

export const getMentor = (user: UserID) =>
  db
    .get("mentors")
    // @ts-ignore
    .get(user)
    .value();

export const setMentorSkills = (
  user: UserID,
  skills: {
    [key: string]: boolean;
  }
) =>
  db
    .get("mentors")
    // @ts-ignore
    .get(user)
    .set("skills", skills)
    .write();

export const getOnline = () => db.get("online").value() || 0;

export const setOnline = (count: number) => db.set("online", count).write();

export const getCreated = () => db.get("created").value() || 0;

export const bumpCreated = () => db.set("created", getCreated() + 1).write();
