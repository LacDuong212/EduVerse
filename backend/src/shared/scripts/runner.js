import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  cleanupAndHealUserData, cleanupOrphanedCurriculums, flagOrphanedVideosForCron, syncAllCourseStats, syncAllStudents, syncAllInstructors
} from "./db-sync.js";
import logger from '#utils/logger.js';

dotenv.config();

const run = async () => {
  try {
    logger.debug("--- DB MAINTENANCE STARTING ---");
    await mongoose.connect(process.env.MONGODB_URI);
    logger.debug("Connected to Database.");

    const task = process.argv[2];

    switch (task) {
      case 'sync-users':
        await cleanupAndHealUserData();
        break;
      case 'cleanup-videos':
        await flagOrphanedVideosForCron();
        break;
      case 'sync-curriculums':
        await cleanupOrphanedCurriculums();
        break;
      case 'sync-courses':
        await syncAllCourseStats();
        break;
      case 'sync-students':
        await syncAllStudents();
        break;
      case 'sync-instructors':
        await syncAllInstructors();
        break;
      case 'full-maintenance':
        await cleanupAndHealUserData();
        await flagOrphanedVideosForCron();
        await cleanupOrphanedCurriculums();
        await syncAllCourseStats();
        await syncAllStudents();
        await syncAllInstructors();
        break;
      default:
        logger.debug("Please specify a task: sync-users, cleanup-videos, sync-curriculums, sync-courses, sync-students, sync-instructors or full-maintenance");
    }

    logger.debug("--- MAINTENANCE COMPLETE ---");
  } catch (error) {
    logger.error("Critical Error during script execution:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();