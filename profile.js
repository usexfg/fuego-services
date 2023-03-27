import inspector from "inspector";
import util from "util";

let session = new inspector.Session();
session.connect();

let post = util.promisify(session.post.bind(session));
let delay = ms => new Promise(res => setTimeout(res, ms));
let profilerRunning = false;

export async function runProfiler(seconds) {
  if (profilerRunning) {
    throw new Error('Profiler already running, try again later')
  }
  profilerRunning = true
  let profile
  try {
    await post('Profiler.enable');
    await post('Profiler.start');
    await delay(seconds * 1000);
    profile = (await post('Profiler.stop')).profile;
  } catch (er) {
    console.error('Profiler error:', er);
  } finally {
    await post('Profiler.disable')
    profilerRunning = false;
  }
  return profile;
};