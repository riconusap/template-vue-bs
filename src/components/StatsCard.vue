<template>
  <el-card class="stats-card" :class="`stats-card--${color}`">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <p class="stats-card__title mb-2">{{ title }}</p>
        <h3 class="stats-card__value m-0">{{ formattedValue }}</h3>
      </div>
      <div class="stats-card__icon">
        <fa-icon :icon="mappedIcon" />
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { 
  faChartLine, 
  faCheckCircle, 
  faExclamationTriangle, 
  faTimesCircle,
  faDollarSign,
  faShoppingCart,
  faUsers,
  faBox
} from '@fortawesome/free-solid-svg-icons';

const ICON_MAPPING: Record<string, any> = {
  DataLine: faChartLine,
  SuccessFilled: faCheckCircle,
  Warning: faExclamationTriangle,
  CircleCloseFilled: faTimesCircle,
  Money: faDollarSign,
  ShoppingCart: faShoppingCart,
  User: faUsers,
  Box: faBox
};

export default defineComponent({
  name: 'StatsCard',
  props: {
    title: {
      type: String as PropType<string>,
      required: true
    },
    value: {
      type: Number as PropType<number>,
      required: true
    },
    icon: {
      type: String as PropType<string>,
      default: 'DataLine'
    },
    color: {
      type: String as PropType<'primary' | 'success' | 'warning' | 'danger'>,
      default: 'primary'
    }
  },
  setup(props) {
    const formattedValue = computed(() => {
      return props.value.toLocaleString();
    });

    const mappedIcon = computed(() => {
      return ICON_MAPPING[props.icon] || ICON_MAPPING.DataLine;
    });

    return {
      formattedValue,
      mappedIcon
    };
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.stats-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  &__title {
    color: #909399;
    font-size: 14px;
  }

  &__value {
    font-size: 28px;
    font-weight: bold;
  }

  &__icon {
    font-size: 48px;
    opacity: 0.6;
  }

  &--primary &__icon {
    color: $primary-color;
  }

  &--success &__icon {
    color: $success-color;
  }

  &--warning &__icon {
    color: $warning-color;
  }

  &--danger &__icon {
    color: $danger-color;
  }
}
</style>
