<template>
  <div class="employee-list">
    <slot />
  </div>
</template>

<style>
  .employee-list {
    display: flex;
    flex-wrap: wrap;
  }

  .employee-list > div {
    max-width: calc(50% - 1em);
    box-sizing: border-box;
    margin: 1rem .25em;
    min-width: 10em
  }

  @media screen and (min-width: 900px) {
    .employee-list > div {
      max-width: calc(33% -  1em);
    }
  }

  @media screen and (min-width: 1160px) {
    .employee-list > div {
      max-width: calc(25% - 1em);
    }
  }
</style>
