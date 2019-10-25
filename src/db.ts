/* eslint-disable @typescript-eslint/ban-ts-ignore */
// import low from "lowdb";
import { ObjectID, DBRef } from 'mongodb';
// import FileSync from "lowdb/adapters/FileSync";
import {
  Session,
  UserID,
  TS,
  Mentor,
  isActive,
  isClaimed,
  ActiveSession
} from "typings";

import DB from 'mongo';

// if ((await this.db()).SlackSessions.value() == null) {
//   db.set("sessions", {}).write();
// }

export default class Store {
  online: number
  created: number
  public constructor() {
    // just stored in memory
    this.created = 0
    this.online = 0
  }
  // connects once
  db = async () =>
    await new DB().collections

  public async getSession(user: UserID): Promise<Session> {
    const sessions = (await this.db()).SlackSessions
    // @ts-ignore
    return sessions.find({ id: user }).toArray()
  }

  public async getSessionsToBump() {
    const sessions = (await this.db()).SlackSessions
      // @ts-ignore
      .filter(
        (session: Session) =>
          isActive(session) &&
          !isClaimed(session) &&
          new Date(session.last_updated).getTime() <
          new Date().getTime() - 1000 * 60 * 10
      )
      .value() as ActiveSession[];
    for (const session of sessions) {
      session.
        // @ts-ignore
        .get(session.id)
        .set("last_updated", new Date().toString())
        .write();
    }
    return sessions;
  }

  public async async updateSession<T extends Partial<Session>>(
    user: UserID,
    newSession: T
  ): Promise<Session & T> {
    const session = {
      ...(this.getSession(user) || {}),
      ...newSession,
      id: user,
      // eslint-disable-next-line @typescript-eslint/camelcase
      last_updated: new Date().toString()
    };
    const sessions = (await this.db()).SlackSessions
    const updated = sessions.updateOne({ id: user }, session)
    return updated;
  }

  public async clearSession(user: UserID) {
    const sessions = (await this.db()).SlackSessions
    return sessions
      // @ts-ignore
      .get(user)
      .set("ts", undefined)
      .set("mentor", undefined)
      .set("mentor_claim_ts", undefined)
      .set("group_id", undefined)
      .write();
  }

  public async getUserIdByThreadTs(threadTs: TS): Promise<UserID | undefined> {
    const sessions = (await this.db()).SlackSessions
    const users = await sessions.find({ ts: threadTs }).toArray()
    return users.length > 0 ? users[0].id : undefined
  }

  public async getMentors = () => {
    const mentors = (await this.db()).SlackMentors
    return mentors.find({}).toArray();
  }

  public async setMentors = (mentors: { [key: string]: Mentor }) =>
    // uhhhh
    db.set("mentors", mentors).write();

  public async getMentor = (user: UserID): Promise<Mentor | null> => {
    const mentors = (await this.db()).SlackMentors
    return mentors.findOne({ id: user });
  }

  public async setMentorSkills(
    user: UserID,
    skills: {
      [key: string]: boolean;
    }
  ) {
    const mentors = (await this.db()).SlackMentors
    return mentors
      // @ts-ignore
      .get(user)
      .set("skills", skills)
      .write();
  }

  public async getOnline() { return this.online }

  public async setOnline(count: number) { this.online = count }

  public async getCreated() { return this.created }

  public async bumpCreated() { this.created += 1 }

} 