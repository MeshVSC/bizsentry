import React from 'react';
import { GlowCard } from '../components/SpotlightCards';

const Demo = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <GlowCard glowColor="blue" size="md">
        <p>This is a blue glowing card!</p>
      </GlowCard>
      <GlowCard glowColor="purple" size="lg">
        <p>This is a purple glowing card!</p>
      </GlowCard>
      <GlowCard glowColor="green" customSize width="300px" height="400px">
        <p>This is a custom-sized green glowing card!</p>
      </GlowCard>
    </div>
  );
};

export default Demo;    