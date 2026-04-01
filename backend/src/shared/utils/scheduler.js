import cron from "node-cron";
import logger from "#utils/logger.js";

// PER SERVER CRON SCHEDULER

const tasks = [];

// register a task
export const registerTask = (name, schedule, fn) => {
  const task = cron.schedule(schedule, async () => {
    try {
      await fn();
    } catch (err) {
      logger.error(`> Error in task [${name}]:`, err.message);
    }
  });

  tasks.push({ name, schedule, task });
  //logger.debug(`> Registered task: ${name} (${schedule})`);
};

// start all tasks
export const startAllTasks = () => {
  tasks.forEach(({ name, task }) => {
    task.start();
    logger.debug(`> Started task: ${name}`);
  });
};

// stop all tasks
export const stopAllTasks = () => {
  tasks.forEach(({ name, task }) => {
    task.stop();
    logger.debug(`> Stopped task: ${name}`);
  });
};
