import cron from "node-cron";

// this is a "one cron per server", 
// do keep in mind when running a cluster of server

const tasks = [];

// register a task
export const registerTask = (name, schedule, fn) => {
  const task = cron.schedule(schedule, async () => {
    try {
      await fn();
    } catch (err) {
      console.error(`> Error in task [${name}]:`, err.message);
    }
  });

  tasks.push({ name, schedule, task });
  //console.log(`> Registered task: ${name} (${schedule})`);
};

// start all tasks
export const startAllTasks = () => {
  tasks.forEach(({ name, task }) => {
    task.start();
    console.log(`> Started task: ${name}`);
  });
};

// stop all tasks
export const stopAllTasks = () => {
  tasks.forEach(({ name, task }) => {
    task.stop();
    console.log(`> Stopped task: ${name}`);
  });
};
