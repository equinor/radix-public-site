<template>
  <div class="employee-card">
    <div class="employee-card-content">
      <div class="employee-card-image">
        <slot>
          <img
            id=image-placeholder
            src="/images/banner-logo.svg"
            alt="{{ name }}"
          />
        </slot>
      </div>
      <div class="employee-card-container">
        <h3>{{ name }}</h3>
        <p class="employee-card-title">{{ title || 'untitled'}}</p>
        <p>{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      name: String,
      title: String,
      image: String,
      description: String,
    },
  }
</script>

<style>
  .employee-card {
    width: calc(25% - 1em);
    margin-bottom: 16px;
    margin-top: 16px;
    padding: 0 8px;
  }

  .employee-card-image > img {
    border-radius: 50%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .employee-card-image > #image-placeholder {
    border-radius: 0;
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
  }
  .employee-card-image-placeholder {
    border-radius: 0;
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
  }

  .employee-card-content {
    padding: 5px 5px 0 5px;
    height: 100%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 20%);
  }

  .employee-card-container {
    padding: 0 16px;
  }

  .employee-card-container::after {
    content: "";
    clear: both;
    display: table;
  }

  .employee-card-title {
    color: grey;
  }
</style>
