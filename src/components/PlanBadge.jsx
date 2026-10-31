import Badge from './Badge'
import { getPlan } from '../utils/planFeatures'

export default function PlanBadge({ plan }) {
  return <Badge tone={plan}>{getPlan(plan).label}</Badge>
}
