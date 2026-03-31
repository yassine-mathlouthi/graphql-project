import React from 'react';
import { useSubscription } from '@apollo/client';
import toast, { Toaster } from 'react-hot-toast';
import { GAME_ADDED, GAME_UPDATED, GAME_DELETED } from '../graphql/subscriptions';

export default function LiveNotifications() {
  useSubscription(GAME_ADDED, {
    onData: ({ data }) => {
      if (data?.data?.gameAdded) {
        toast.success(`New game added: ${data.data.gameAdded.title}!`, {
          icon: '🎮',
          position: 'bottom-right',
        });
      }
    }
  });

  useSubscription(GAME_UPDATED, {
    onData: ({ data }) => {
      if (data?.data?.gameUpdated) {
        toast('Game updated: ' + data.data.gameUpdated.title, {
          icon: '✏️',
          position: 'bottom-right',
        });
      }
    }
  });

  useSubscription(GAME_DELETED, {
    onData: ({ data }) => {
      if (data?.data?.gameDeleted) {
        toast.error(`A game was deleted.`, {
          icon: '🗑️',
          position: 'bottom-right',
        });
      }
    }
  });

  return <Toaster toastOptions={{
    style: {
      borderRadius: '0',
      background: '#333',
      color: '#fff',
      fontSize: '14px',
    }
  }} />;
}
