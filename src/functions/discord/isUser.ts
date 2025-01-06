import type { GuildMember, PermissionResolvable } from "discord.js";

import logger from "../../logger.js";

interface IUserCheckOptions {
  permissions: PermissionResolvable;
  userIdList: string[];
}

/**
 * Check if a user passes some check and return the verdict as a boolean. Currently implemented: permissions and user list
 *
 * Note: Permissions checks will automatically return true if the user has the `ADMINISTRATOR` permission!
 *
 */
export default (member: GuildMember, options: Partial<IUserCheckOptions>): boolean => {
  logger.verbose("Function/isUser", { member, options });

  if (Object.keys(options).length > 0) {
    if (options.permissions !== undefined) {
      if (!member.permissions.has(options.permissions, true)) {
        logger.verbose("User does not have permission!");
        return false;
      }
    }

    if (options.userIdList !== undefined) {
      if (!options.userIdList.includes(member.user.id)) {
        logger.verbose("User is not in specified user list!");
        return false;
      }
    }

    logger.verbose("Function/isUser: User passed all checks!");
    return true;
  }
  logger.verbose("Function/isUser: No options specified, returning false!");
  return false;
};
