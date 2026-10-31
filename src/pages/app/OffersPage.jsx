import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { CalendarRange, ChevronRight, Plus, Sparkles } from 'lucide-react'

import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import Switch from '../../components/Switch'
import { selectLookups, selectOffers, selectRewards } from '../../app/selectors'
import { describeRule, offerStatus } from '../../features/offers/offersEngine'
import { offerToggled } from '../../features/offers/offersSlice'
import { formatDate, formatPercent } from '../../utils/format'

export default function OffersPage() {
  const dispatch = useDispatch()
  const offers = useSelector(selectOffers)
  const rewards = useSelector(selectRewards)
  const lookups = useSelector(selectLookups)

  const statsByOffer = useMemo(() => {
    const stats = {}
    rewards.forEach((reward) => {
      const entry = (stats[reward.offerId] ??= { earned: 0, redeemed: 0, waiting: 0 })
      if (reward.status === 'cancelled') return
      entry.earned += 1
      if (reward.status === 'redeemed') entry.redeemed += 1
      if (reward.status === 'available') entry.waiting += 1
    })
    return stats
  }, [rewards])

  return (
    <>
      <PageHeader
        eyebrow="Manage"
        title="Offers"
        description="Stamp-card rules that run automatically every time a bill is saved."
        actions={
          <Button icon={Plus} to="/offers/new">
            New offer
          </Button>
        }
      />

      {offers.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => {
            const status = offerStatus(offer)
            const stats = statsByOffer[offer.id] ?? { earned: 0, redeemed: 0, waiting: 0 }
            const ended = status.label === 'Ended'
            return (
              <article key={offer.id} className={`card flex flex-col p-5 ${ended ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-roast-50 text-roast-600">
                      <Sparkles className="size-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="display-title text-[22px] leading-tight">{offer.name}</h2>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-espresso-600">{describeRule(offer, lookups)}</p>
                    </div>
                  </div>
                  {!ended && (
                    <Switch
                      checked={offer.active}
                      onChange={() => dispatch(offerToggled(offer.id))}
                      label={`${offer.name} active`}
                    />
                  )}
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-cream-50 p-3 text-center">
                  <div>
                    <dt className="text-xs text-espresso-500">Earned</dt>
                    <dd className="tabular text-lg font-semibold">{stats.earned}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-espresso-500">Redeemed</dt>
                    <dd className="tabular text-lg font-semibold">
                      {stats.redeemed}
                      <span className="ml-1 text-xs font-normal text-espresso-500">
                        {stats.earned ? formatPercent(stats.redeemed / stats.earned) : ''}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-espresso-500">Waiting</dt>
                    <dd className="tabular text-lg font-semibold">{stats.waiting}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between text-[13px] text-espresso-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="size-3.5" />
                    {offer.validFrom ? formatDate(offer.validFrom) : 'Any time'} →{' '}
                    {offer.validTo ? formatDate(offer.validTo) : 'no end date'}
                  </span>
                  <Link
                    to={`/offers/${offer.id}`}
                    className="flex items-center gap-0.5 font-medium text-roast-600 hover:text-roast-700"
                  >
                    Edit <ChevronRight className="size-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={Sparkles}
            title="No offers yet"
            description="Create a rule like “after 6 bills, the 7th is free” and it runs on every bill automatically."
            action={
              <Button icon={Plus} to="/offers/new">
                Create your first offer
              </Button>
            }
          />
        </div>
      )}
    </>
  )
}
