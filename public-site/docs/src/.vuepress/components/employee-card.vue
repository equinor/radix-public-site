<template>
  <div class="employee-card">
    <div class="employee-card-content" v-html="content" />
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
    data() {
      return {
        content: `
          ${this.$props.image ? (`
            <img
              class="employee-card-image"
              src="${this.$props.image}"
              alt="${this.$props.name}"
            />
          `) : (`
            <img
              class="employee-card-image-placeholder"
              src="/images/banner-logo.svg"
              alt="${this.$props.name}"
            />
          `)}
          <div class="employee-card-container">
            <h3>${this.$props.name}</h3>
            <p class="employee-card-title">${this.$props.title || 'untitled'}</p>
            <p>${this.$props.description || ''}</p>
          </div>
        `,
      };
    }
  }
</script>

<style>
  .employee-card {
    width: calc(33.3% - 1em);
    margin-bottom: 16px;
    padding: 0 8px;
    min-width: 175px;
  }

  .employee-card-image {
    border-radius: 50%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .employee-card-image-placeholder {
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
