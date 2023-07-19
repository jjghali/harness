import React, { useMemo } from 'react'
import {
  Avatar,
  Button,
  ButtonVariation,
  Container,
  Layout,
  Page,
  StringSubstitute,
  TableV2,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { CellProps, Column } from 'react-table'
import { Render } from 'react-jsx-match'

import { useConfirmAct } from 'hooks/useConfirmAction'
import { usePageIndex } from 'hooks/usePageIndex'
import { useStrings } from 'framework/strings'
import { TypesUser, useAdminDeleteUser, useAdminListUsers, useUpdateUserAdmin } from 'services/code'
import { getErrorMessage } from 'utils/Utils'
import { ResourceListingPagination } from 'components/ResourceListingPagination/ResourceListingPagination'
import { OptionsMenuButton } from 'components/OptionsMenuButton/OptionsMenuButton'
import { LoadingSpinner } from 'components/LoadingSpinner/LoadingSpinner'

import useAddUserModal from 'components/UserManagementFlows/AddUserModal'
import useResetPasswordModal from 'components/UserManagementFlows/ResetPassword'

import css from './UsersListing.module.scss'

const UsersListing = () => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [page, setPage] = usePageIndex()

  const { data, response, refetch, loading } = useAdminListUsers({
    queryParams: {
      page
    }
  })
  const { mutate: deleteUser } = useAdminDeleteUser({})

  const { openModal } = useAddUserModal({ onClose: refetch })
  const { openModal: openResetPasswordModal } = useResetPasswordModal()

  const onConfirmAct = useConfirmAct()

  const handleDeleteUser = async (userId: string, displayName?: string) =>
    await onConfirmAct({
      action: async () => {
        try {
          await deleteUser(userId)
          showSuccess(getString('newUserModal.userDeleted', { name: displayName }))
          refetch()
        } catch (error) {
          showError(getErrorMessage(error))
        }
      },
      message: (
        <Text font={{ variation: FontVariation.BODY2 }}>
          <StringSubstitute
            str={getString('userManagement.deleteUserMsg', { displayName, userId })}
            vars={{ avatar: <Avatar name={displayName} /> }}
          />
        </Text>
      ),
      intent: 'danger',
      title: getString('userManagement.deleteUser')
    })

  const columns: Column<TypesUser>[] = useMemo(
    () => [
      {
        Header: getString('displayName'),
        width: '30%',
        Cell: ({ row }: CellProps<TypesUser>) => {
          return (
            <Layout.Horizontal style={{ alignItems: 'center' }}>
              <Avatar name={row.original.display_name} size="normal" hoverCard={false} />
              <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ right: 'small' }} lineClamp={1}>
                {row.original.display_name}
              </Text>
              <Render when={row.original.admin}>
                <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.PRIMARY_9} className={css.adminBadge}>
                  {getString('admin')}
                </Text>
              </Render>
            </Layout.Horizontal>
          )
        }
      },
      {
        Header: getString('userId'),
        width: '30%',
        Cell: ({ row }: CellProps<TypesUser>) => (
          <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
            {row.original.uid}
          </Text>
        )
      },
      {
        Header: getString('email'),
        width: '35%',
        Cell: ({ row }: CellProps<TypesUser>) => {
          return (
            <Text font={{ variation: FontVariation.SMALL }} lineClamp={1}>
              {row.original.email}
            </Text>
          )
        }
      },
      {
        accessor: 'uid',
        Header: '',
        width: '5%',
        Cell: ({ row }: CellProps<TypesUser>) => {
          const { mutate: updateAdmin } = useUpdateUserAdmin({ user_uid: row.original.uid || '' })

          const handleUpdateAdmin = async () =>
            await onConfirmAct({
              action: async () => {
                try {
                  await updateAdmin({ admin: !row.original.admin })
                  refetch()
                } catch (error) {
                  showError(getErrorMessage(error))
                }
              },
              message: (
                <Text font={{ variation: FontVariation.BODY2 }}>
                  <StringSubstitute
                    str={getString(
                      row.original.admin ? 'userManagement.removeAdminMsg' : 'userManagement.setAsAdminMsg',
                      {
                        displayName: row.original.display_name,
                        userId: row.original.uid
                      }
                    )}
                    vars={{ avatar: <Avatar name={row.original.display_name} /> }}
                  />
                </Text>
              ),
              intent: 'danger',
              title: getString('userManagement.deleteUser')
            })

          return (
            <OptionsMenuButton
              tooltipProps={{ isDark: true }}
              items={[
                {
                  text: row.original.admin ? getString('removeAdmin') : getString('setAsAdmin'),
                  onClick: () => handleUpdateAdmin()
                },
                {
                  text: getString('userManagement.resetPassword'),
                  onClick: () => openResetPasswordModal({ userInfo: row.original })
                },
                {
                  text: getString('editUser'),
                  onClick: () => openModal({ isEditing: true, userInfo: row.original })
                },
                {
                  text: getString('deleteUser'),
                  onClick: () => handleDeleteUser(row.original.uid as string, row.original.display_name)
                }
              ]}
            />
          )
        }
      }
    ],
    []
  )

  return (
    <Container className={css.mainCtn}>
      <Page.Header title={getString('users')} />
      <Page.Body>
        <Container padding="xlarge">
          <LoadingSpinner visible={loading} />
          <Button
            icon="plus"
            text={getString('userManagement.newUser')}
            variation={ButtonVariation.PRIMARY}
            margin={{ bottom: 'medium' }}
            onClick={() => openModal({})}
          />
          <TableV2 data={data || []} columns={columns} />
          <ResourceListingPagination response={response} page={page} setPage={setPage} />
        </Container>
      </Page.Body>
    </Container>
  )
}

export default UsersListing