import { Ionicons } from '@expo/vector-icons'
import { Modal, Pressable, Text, View } from 'react-native'
import { useState } from 'react'

import { useFilter } from '~/hooks/use-filters'

import { P } from './p'
import { useTheme } from '~/hooks/use-theme'

export function Size() {
  const { setFilter, filter } = useFilter()
  const {
    BORDER_PRIMARY,
    BACKGROUND_PRIMARY,
    BACKGROUND_SECONDARY,
    TEXT_PRIMARY,
  } = useTheme()

  const [open, setOpen] = useState(false)

  return (
    <View>
      <Modal visible={open} transparent>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1 }}>
          <View
            style={{
              position: 'absolute',
              right: 5,
              top: 0,
              borderRadius: 24,
              backgroundColor: BACKGROUND_PRIMARY,
              padding: 12,
              borderWidth: 1,
              borderColor: BORDER_PRIMARY,
            }}>
            {['5', '20', '30', '40', '50+'].map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setOpen((prev) => !prev)
                  setFilter({ SIZE: item })
                }}
                className="h-12 flex-row items-center justify-center rounded-full px-5">
                <P className="font-inter-semibold text-sm uppercase">{item}</P>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={{
          height: 40,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: BORDER_PRIMARY,
          backgroundColor: BACKGROUND_SECONDARY,
        }}>
        <Text
          style={{
            marginRight: 10,
            fontFamily: 'inter-semibold',
            fontSize: 12,
            textTransform: 'uppercase',
            color: TEXT_PRIMARY,
          }}>
          {filter.SIZE}
        </Text>
        <Ionicons name="chevron-down-outline" color="#305a96" size={18} />
      </Pressable>
    </View>
  )
}
