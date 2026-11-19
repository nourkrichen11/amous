import * as migration_20260812_amous_admin_foundation from './20260812_amous_admin_foundation';
import * as migration_20260825_order_workflow_inventory_integrity from './20260825_order_workflow_inventory_integrity';
import * as migration_20260826_add_user_sessions from './20260826_add_user_sessions';
import * as migration_20261119_094655_product_admin_fields from './20261119_094655_product_admin_fields';

export const migrations = [
  {
    up: migration_20260812_amous_admin_foundation.up,
    down: migration_20260812_amous_admin_foundation.down,
    name: '20260812_amous_admin_foundation',
  },
  {
    up: migration_20260825_order_workflow_inventory_integrity.up,
    down: migration_20260825_order_workflow_inventory_integrity.down,
    name: '20260825_order_workflow_inventory_integrity',
  },
  {
    up: migration_20260826_add_user_sessions.up,
    down: migration_20260826_add_user_sessions.down,
    name: '20260826_add_user_sessions',
  },
  {
    up: migration_20261119_094655_product_admin_fields.up,
    down: migration_20261119_094655_product_admin_fields.down,
    name: '20261119_094655_product_admin_fields'
  },
];
