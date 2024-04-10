import {serverAdminId} from '../config.js';
import {addAdmin} from '../authz';

const initDb = () => {
  if (serverAdminId && serverAdminId !== '') {
    return addAdmin(serverAdminId);
  }
};

export default initDb;
