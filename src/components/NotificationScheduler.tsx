import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { checkAndNotify } from '../lib/notify';

export default function NotificationScheduler() {
  const tasks = useLiveQuery(
    () => db.tasks.where('status').equals('active').toArray(),
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndNotify(tasks ?? []);
    }, 30000);
    checkAndNotify(tasks ?? []);
    return () => clearInterval(interval);
  }, [tasks]);

  return null;
}
