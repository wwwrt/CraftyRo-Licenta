<template>
  <ul>
    <li v-for="user in sortedUsers" :key="user.id" class="flex items-center py-4 px-6">
      <span class="text-[#faedcd] text-lg font-medium mr-4">{{ user.number }}.</span>
      <img class="w-12 h-12 rounded-full object-cover mr-4" :src="user.profileImage" :alt="user.name">
      <div class="flex-1">
        <h3 class="text-lg font-medium text-[#826a48]">{{ user.name }}</h3>
        <p class="text-[#faedcd] text-base">{{ user.points }} points</p>
      </div>
    </li>
  </ul>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    sortType: String,
    sortDescending: Boolean
  },
  setup(props) {
    const users = ref([]);

    const fetchUsers = async () => {
      try {
        const response = await fetch('./data/leaderboard.json');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        users.value = await response.json();
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    const sortedUsers = computed(() => {
      let usersCopy = [...users.value];
      if (props.sortType === 'name') {
        usersCopy.sort((a, b) => props.sortDescending ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
      } else {
        usersCopy.sort((a, b) => props.sortDescending ? b.points - a.points : a.points - b.points);
      }
      return usersCopy;
    });

    fetchUsers();

    return { sortedUsers };
  }
};
</script>

<style>
</style>
