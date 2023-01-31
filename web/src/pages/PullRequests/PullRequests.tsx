import React, { useMemo, useState } from 'react'
import { Container, PageBody, Text, Color, TableV2, Layout, StringSubstitute } from '@harness/uicore'
import { useHistory } from 'react-router-dom'
import { useGet } from 'restful-react'
import type { CellProps, Column } from 'react-table'
import { Case, Match, Render, Truthy } from 'react-jsx-match'
import ReactTimeago from 'react-timeago'
import { makeDiffRefs, PullRequestFilterOption } from 'utils/GitUtils'
import { useAppContext } from 'AppContext'
import { useGetRepositoryMetadata } from 'hooks/useGetRepositoryMetadata'
import { useStrings } from 'framework/strings'
import { RepositoryPageHeader } from 'components/RepositoryPageHeader/RepositoryPageHeader'
import { voidFn, getErrorMessage, LIST_FETCHING_LIMIT } from 'utils/Utils'
import { usePageIndex } from 'hooks/usePageIndex'
import type { TypesPullReq, TypesRepository } from 'services/code'
import { ResourceListingPagination } from 'components/ResourceListingPagination/ResourceListingPagination'
import { NoResultCard } from 'components/NoResultCard/NoResultCard'
import { PullRequestStateLabel } from 'components/PullRequestStateLabel/PullRequestStateLabel'
import { LoadingSpinner } from 'components/LoadingSpinner/LoadingSpinner'
import { PullRequestsContentHeader } from './PullRequestsContentHeader/PullRequestsContentHeader'
import css from './PullRequests.module.scss'

export default function PullRequests() {
  const { getString } = useStrings()
  const history = useHistory()
  const { routes } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<string>(PullRequestFilterOption.OPEN)
  const [page, setPage] = usePageIndex()
  const { repoMetadata, error, loading, refetch } = useGetRepositoryMetadata()
  const {
    data,
    error: prError,
    loading: prLoading,
    response
  } = useGet<TypesPullReq[]>({
    path: `/api/v1/repos/${repoMetadata?.path}/+/pullreq`,
    queryParams: {
      limit: String(LIST_FETCHING_LIMIT),
      page,
      sort: filter == PullRequestFilterOption.MERGED ? 'merged' : 'number',
      order: 'desc',
      query: searchTerm,
      state: filter == PullRequestFilterOption.ALL ? '' : filter
    },
    lazy: !repoMetadata
  })
  const columns: Column<TypesPullReq>[] = useMemo(
    () => [
      {
        id: 'title',
        width: '100%',
        Cell: ({ row }: CellProps<TypesPullReq>) => {
          return (
            <Layout.Horizontal className={css.titleRow} spacing="medium">
              <PullRequestStateLabel data={row.original} iconOnly />
              <Container padding={{ left: 'small' }}>
                <Layout.Vertical spacing="small">
                  <Text icon="success-tick" color={Color.GREY_800} className={css.title}>
                    {row.original.title}
                  </Text>
                  <Text color={Color.GREY_500}>
                    <StringSubstitute
                      str={getString('pr.statusLine')}
                      vars={{
                        state: row.original.state,
                        number: <Text inline>{row.original.number}</Text>,
                        time: (
                          <ReactTimeago
                            date={
                              (row.original.state == 'merged' ? row.original.merged : row.original.created) as number
                            }
                          />
                        ),
                        user: row.original.author?.display_name
                      }}
                    />
                  </Text>
                </Layout.Vertical>
              </Container>
            </Layout.Horizontal>
          )
        }
      }
    ],
    [getString]
  )

  return (
    <Container className={css.main}>
      <RepositoryPageHeader
        repoMetadata={repoMetadata}
        title={getString('pullRequests')}
        dataTooltipId="repositoryPullRequests"
      />
      <PageBody error={getErrorMessage(error || prError)} retryOnError={voidFn(refetch)}>
        <LoadingSpinner visible={loading} />

        <Render when={repoMetadata}>
          <Layout.Vertical>
            <PullRequestsContentHeader
              loading={prLoading}
              repoMetadata={repoMetadata as TypesRepository}
              onPullRequestFilterChanged={_filter => {
                setFilter(_filter)
                setPage(1)
              }}
              onSearchTermChanged={value => {
                setSearchTerm(value)
                setPage(1)
              }}
            />
            <Container padding="xlarge">
              <Match expr={data?.length}>
                <Truthy>
                  <>
                    <TableV2<TypesPullReq>
                      className={css.table}
                      hideHeaders
                      columns={columns}
                      data={data || []}
                      getRowClassName={() => css.row}
                      onRowClick={row => {
                        history.push(
                          routes.toCODEPullRequest({
                            repoPath: repoMetadata?.path as string,
                            pullRequestId: String(row.number)
                          })
                        )
                      }}
                    />
                    <ResourceListingPagination response={response} page={page} setPage={setPage} />
                  </>
                </Truthy>
                <Case val={0}>
                  <NoResultCard
                    forSearch={!!searchTerm}
                    message={getString('pullRequestEmpty')}
                    buttonText={getString('newPullRequest')}
                    onButtonClick={() =>
                      history.push(
                        routes.toCODECompare({
                          repoPath: repoMetadata?.path as string,
                          diffRefs: makeDiffRefs(repoMetadata?.default_branch as string, '')
                        })
                      )
                    }
                  />
                </Case>
              </Match>
            </Container>
          </Layout.Vertical>
        </Render>
      </PageBody>
    </Container>
  )
}