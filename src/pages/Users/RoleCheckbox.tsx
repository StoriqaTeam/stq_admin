import * as React from 'react';
import { Checkbox } from 'antd';

import {
  UserMicroserviceRole,
  StoresMicroserviceRole,
} from '../../../__generated__/globalTypes';

export type AvailableUserRoleType =
  | UserMicroserviceRole.SUPERUSER
  | UserMicroserviceRole.MODERATOR
  | StoresMicroserviceRole.SUPERUSER
  | StoresMicroserviceRole.MODERATOR
  | StoresMicroserviceRole.PLATFORM_ADMIN;

interface PropsType {
  role: AvailableUserRoleType;
  label: string;
  checked: boolean;
  onRoleToggle: (role: AvailableUserRoleType, checked: boolean) => void;
}

class RoleCheckbox extends React.PureComponent<PropsType> {
  render() {
    return (
      <Checkbox
        onChange={e => {
          this.props.onRoleToggle(this.props.role, e.target.checked);
        }}
        checked={this.props.checked}
      >
        {this.props.label}
      </Checkbox>
    );
  }
}

export default RoleCheckbox;
