<template>
  <div class="employee-list">
    <slot />
  </div>
</template>

<style scoped>
  .employee-list {
    display: flex;
    flex-wrap: wrap;
  }

  .employee-list div {
    flex: 1 0 calc(33.3% - 1em);
    box-sizing: border-box;
    margin: 1rem .25em;
  }

  @media screen and (min-width: 40em) {
    .employee-list div {
      max-width: calc(50% -  1em);
    }
  }

  @media screen and (min-width: 60em) {
    .employee-list div {
      max-width: calc(25% - 1em);
    }
  }
</style>
