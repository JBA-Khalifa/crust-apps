// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';
import { Badge, Icon } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import { useTranslation } from './translate';

interface Props {
  className?: string;
}

function Ledgend ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();

  return (
    <div className={className}>
      <span>
        <Badge
          color='blue'
          icon='chevron-right'
        />
        {t('Next session')}
      </span>
      <span>
        <Badge
          color='green'
          info='5'
        />
        {t('Produced blocks')}
      </span>
      <span>
        <Badge
          color='green'
          info={<Icon icon='envelope' />}
        />
        {t('Online message')}
      </span>
      <span>
        <Badge
          color='green'
          icon='hand-paper'
        />
        {t('Guaranteeing')}
      </span>
      <span>
        <Badge
          color='red'
          info={api.consts.staking?.maxNominatorRewardedPerValidator?.toString() || '64'}
        />
        {t('Oversubscribed')}
      </span>
      <span>
        <Badge
          color='red'
          icon='skull-crossbones'
        />
        {t('Slashed')}
      </span>
    </div>
  );
}

export default React.memo(styled(Ledgend)`
  font-size: 0.85rem;
  padding: 1rem 0.5rem 0.5rem;
  text-align: center;

  .ui--Badge {
    margin-right: 0.5rem;
  }

  span+span {
    margin-left: 1rem;
  }
`);
