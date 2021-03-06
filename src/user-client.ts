import {User} from './auth-context';
// this is just a fake user client, in reality it'd probably be using
// window.fetch to actually interact with the user.
const sleep = (t: number) => new Promise(resolve => setTimeout(resolve, t));

// TODO: make this a real request with fetch so the signal does something
type Updates = {
  tagline: string;
  bio: string;
};
async function updateUser(user: User, updates: Updates, signal?: any) {
  await sleep(1500); // simulate a real-world wait period
  if (`${updates.tagline} ${updates.bio}`.includes('fail')) {
    return Promise.reject({message: 'Something went wrong'});
  }
  return {...user, ...updates};
}

export {updateUser};
