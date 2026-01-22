/**
 * Digiko UI Component Library
 * 
 * Central export for all reusable UI components.
 * Import from here for consistency and ease of use.
 * 
 * @example
 * import { Button, Input, Card, Badge, SectionTitle } from '@/components/ui';
 */

// ============================================
// FORM INPUTS - Unified Design System
// ============================================

// Text Inputs
export { TextInput, SearchInput, AddressInput } from './TextInput';
export type { TextInputProps } from './TextInput';

// Select Dropdown
export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Checkbox
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

// Slider
export { Slider } from './Slider';
export type { SliderProps } from './Slider';

// Legacy Form Components (use unified components above for new code)
export { Button } from '../Button';
export type { ButtonProps } from '../Button';

export { Input } from '../Input';
export type { InputProps } from '../Input';

export { TokenAmountInput, AmountInput, AmountInputCompact } from '../AmountInput';
export type { TokenAmountInputProps } from '../AmountInput';

// Dropdown Components
export { 
  Dropdown, 
  DropdownItem, 
  DropdownSection, 
  DropdownFooter, 
  DropdownDivider 
} from './Dropdown';
export type { 
  DropdownProps, 
  DropdownItemProps, 
  DropdownSectionProps, 
  DropdownFooterProps,
  DropdownDividerProps 
} from './Dropdown';

// Modal Components
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalIcon,
  ModalDescription,
} from './Modal';
export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalIconProps,
  ModalDescriptionProps,
} from './Modal';

// Pill Components
export { Pill, PillGroup } from './Pill';
export type { PillProps, PillGroupProps } from './Pill';

// BottomSheet Component
export { BottomSheet } from './BottomSheet';
export type { BottomSheetProps } from './BottomSheet';

// Layout Components
export { Card, StatCard, FeatureCard } from '../Card';
export type { CardProps, StatCardProps, FeatureCardProps } from '../Card';

export { IconBox } from '../IconBox';

// Section Components
export { SectionTitle } from '../SectionTitle';
export type { SectionTitleProps } from '../SectionTitle';

export { FeatureLinkCard } from '../FeatureLinkCard';
export type { FeatureLinkCardProps } from '../FeatureLinkCard';

export { StatsGrid } from '../StatsGrid';
export type { StatsGridProps, StatItem } from '../StatsGrid';

export { RoadmapItem } from '../RoadmapItem';
export type { RoadmapItemProps, RoadmapStatus } from '../RoadmapItem';

export { CTASection } from '../CTASection';
export type { CTASectionProps, CTAAction } from '../CTASection';

export { TokenShowcaseCard } from '../TokenShowcaseCard';
export type { TokenShowcaseCardProps, TokenStat } from '../TokenShowcaseCard';

export { InfoCard } from '../InfoCard';
export type { InfoCardProps } from '../InfoCard';

// Empty State Components
export { EmptyStateCard } from '../EmptyStateCard';
export type { EmptyStateCardProps } from '../EmptyStateCard';

// Guide Components
export { GuideItem, GuideItemList } from '../GuideItem';
export type { GuideItemProps, GuideItemListProps } from '../GuideItem';

// Feedback Components
export { Badge, StatusBadge, FeatureBadge } from './Badge';
export type { BadgeProps, StatusBadgeProps, FeatureBadgeProps } from './Badge';

// Action Components
export { RefreshButton } from '../RefreshButton';
export type { RefreshButtonProps } from '../RefreshButton';

export { BalanceRow, BalanceRowGroup } from '../BalanceRow';
export type { BalanceRowProps, BalanceRowGroupProps } from '../BalanceRow';

export { InfoTip } from '../InfoTip';
export type { InfoTipProps } from '../InfoTip';

export { ActionCardHeader } from '../ActionCardHeader';
export type { ActionCardHeaderProps } from '../ActionCardHeader';

// Page Header
export { PageHeader } from '../PageHeader';
export type { PageHeaderProps } from '../PageHeader';

// Metric Components
export { MetricCard, MetricCardGrid } from '../MetricCard';
export type { MetricCardProps, MetricCardGridProps } from '../MetricCard';

// Data Grid Components
export { DataGrid, DataGridItem } from '../DataGrid';
export type { DataGridProps, DataGridItemProps } from '../DataGrid';

// Social Links
export { SocialLinks } from '../SocialLinks';
export type { SocialLinksProps, SocialLink } from '../SocialLinks';

// Donut Chart
export { DonutChart, DonutChartLegend } from '../DonutChart';
export type { DonutChartProps, DonutChartSegment, DonutChartLegendProps } from '../DonutChart';

// Token Components
export { TokenImage } from '../TokenImage';

// Exchange Components
export { ExchangeList } from '../ExchangeList';

// Alert Component
export { Alert } from '../Alert';
export type { AlertProps, AlertVariant } from '../Alert';

// Progress Steps Component
export { ProgressSteps } from '../ProgressSteps';
export type { ProgressStepsProps, Step, StepStatus } from '../ProgressSteps';

// Percentage Selector Component
export { PercentageSelector } from '../PercentageSelector';
export type { PercentageSelectorProps } from '../PercentageSelector';

// Token Pair Badge Component
export { TokenPairBadge, TokenPairLabel } from '../TokenPairBadge';
export type { TokenPairBadgeProps, TokenPairBadgeSize, TokenPairLabelProps } from '../TokenPairBadge';

// Token Input Field Component
export { TokenInputField, TokenInputWithPlus } from '../TokenInputField';
export type { TokenInputFieldProps, TokenInputWithPlusProps } from '../TokenInputField';

