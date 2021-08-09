// Copyright 2017-2021 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';

import BN from 'bn.js';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { Delegation } from '@polkadot/app-accounts/types';
import { useTranslation } from '@polkadot/apps/translate';
import { AddressSmall, Button, Icon, Menu, Popup, StatusContext, Tooltip } from '@polkadot/react-components';
import { useAccountInfo, useApi, useCall, useToggle } from '@polkadot/react-hooks';
import Bond from '../modals/Bond';
import { FoundsType } from '../modals/types';
import { FormatBalance } from '@polkadot/react-query';
import UnLockingSworkFounds from './UnLockingSworkFounds';
import UnbondFounds from '../modals/UnbondFounds';
import RebondFounds from '../modals/RebondFounds';
import AddAllowAccount from '../modals/AddAllowAccount';
import RemoveAllow from '../modals/RemoveAllow';

interface Props {
  account: KeyringAddress;
  reductionQuota: BN;
  totalLockup: BN;
  className?: string;
  delegation?: Delegation;
  filter: string;
  isFavorite: boolean;
  setBalance: (address: string, value: BN) => void;
  toggleFavorite: (address: string) => void;
}

function calcVisible (filter: string, name: string, tags: string[]): boolean {
  if (filter.length === 0) {
    return true;
  }

  const _filter = filter.toLowerCase();

  return tags.reduce((result: boolean, tag: string): boolean => {
    return result || tag.toLowerCase().includes(_filter);
  }, name.toLowerCase().includes(_filter));
}

function Merchant ({ account: { address }, className = '', filter, isFavorite, setBalance, toggleFavorite, reductionQuota, totalLockup }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances.all, [address]);
  const marketLedger = useCall<any>(api.query.benefits.marketBenefits, [address]);
  const ledgerObj = marketLedger && JSON.parse(JSON.stringify(marketLedger));
  const { name: accName, tags } = useAccountInfo(address);
  const [isBondOpen, toggleBond] = useToggle();
  const [isUnBondOpen, toggleUnBond] = useToggle();
  const [isAddAllowOpen, toggleAddAllow] = useToggle();
  const [isRemoveAllowOpen, toggleRemoveAllow] = useToggle();
  const [isSettingsOpen, toggleSettings] = useToggle();
  const [isReBondOpen, toggleReBond] = useToggle();
  const sworkBenefitLedger = useCall<any>(api.query.benefits.sworkBenefits, [address]);
  const { queueExtrinsic } = useContext(StatusContext);
  const percentage = ((sworkBenefitLedger?.active_funds / sworkBenefitLedger?.total_funds) *100).toFixed(2) + '%';

  useEffect((): void => {
    if (balancesAll) {
      setBalance(address, balancesAll.freeBalance.add(balancesAll.reservedBalance));
    }
  }, [address, api, balancesAll, setBalance]);

  const isVisible = useMemo(
    () => calcVisible(filter, accName, tags),
    [accName, filter, tags]
  );

  const _onFavorite = useCallback(
    () => toggleFavorite(address),
    [address, toggleFavorite]
  );

  const withdrawFunds = useCallback(
    () => {
        queueExtrinsic({
            accountId: address,
            extrinsic: api.tx.benefits.withdrawBenefitFunds()
        });
    },
    [api, address, queueExtrinsic]
);

  if (!isVisible) {
    return null;
  }

  return (
    <tr className={className}>
      {isBondOpen && (
        <Bond
          accountId={address}
          onClose={toggleBond}
          foundsType={FoundsType.SWORK}
        />
      )}
      {isUnBondOpen && (
        <UnbondFounds
          accountId={address}
          foundsType={FoundsType.SWORK}
          onClose={toggleUnBond}
        />   
      )}
      {isReBondOpen && (
        <RebondFounds
          accountId={address}
          foundsType={FoundsType.SWORK}
          onClose={toggleReBond}
        />   
      )}
      {isAddAllowOpen && (
        <AddAllowAccount
          account={address}
          foundsType={FoundsType.SWORK}
          onClose={toggleAddAllow}
        />   
      )}
      {isRemoveAllowOpen && (
        <RemoveAllow
          account={address}
          foundsType={FoundsType.SWORK}
          onClose={toggleRemoveAllow}
        />   
      )}
        
      <td className='favorite'>
        <Icon
          color={isFavorite ? 'orange' : 'gray'}
          icon='star'
          onClick={_onFavorite}
        />
      </td>
      <td className='address'>
        <AddressSmall value={address} />
      </td>
      <td className='number together'>
        <FormatBalance value={marketLedger?.active_funds} />
      </td>
      <td className='number together'>
        <UnLockingSworkFounds account={address} />
      </td>
      <td className='number together'>
        <FormatBalance value={marketLedger?.active_funds} />
      </td>
      <td className='number together'>
        <FormatBalance
          className='result'
          label={
            <Icon
              icon='info-circle'
              tooltip={`${address}-market-discount-trigger`}
            />
          }
          value={marketLedger?.unlocking_funds}
        >
          <Tooltip
            text={
              <>
                <div>
                  <div className='faded'>{t('{{percentage}} of transaction fees will be reduced', {
                    replace: {
                      percentage
                    }
                  })}</div>
                </div>
              </>
            }
            trigger={`${address}-market-discount-trigger`}
          />
        </FormatBalance>
      </td>
      
      <td className='number together'>
        <FormatBalance value={new BN(Number(ledgerObj?.active_funds).toString()) } /> 
      </td>
      <td className='button'>
        {api.tx.benefits?.addBenefitFunds && (
          <Button
            icon='lock'
            label={t<string>('Increase lockup')}
            onClick={toggleBond}
          />
        )}
        {api.tx.benefits?.cutBenefitFunds && (
          <Button
            icon='unlock'
            label={t<string>('Unlock')}
            onClick={toggleUnBond}
          />
        )}
        <Popup
            isOpen={isSettingsOpen}
            key='settings'
            onClose={toggleSettings}
            trigger={
                <Button
                    icon='ellipsis-v'
                    onClick={toggleSettings}
                />
            }
        >
            <Menu
                onClick={toggleSettings}
                text
                vertical
            >
                <Menu.Item onClick={toggleReBond}>
                    {t<string>('Rebond')}
                </Menu.Item>
                <Menu.Item onClick={withdrawFunds}>
                    {t<string>('Withdraw unbonded funds')}
                </Menu.Item>
            </Menu>
        </Popup>
      </td>
    </tr>
  );
}

export default React.memo(styled(Merchant)`
  .tags {
    width: 100%;
    min-height: 1.5rem;
  }
`);