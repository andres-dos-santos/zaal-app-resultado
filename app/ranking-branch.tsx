import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native'
import { Link, Stack } from 'expo-router'

import { api } from '~/api/api'

import { Chart } from '~/components/chart'
import {
  Sheet,
  SheetHeader,
  SheetListColor,
  SheetListItem,
  SheetListItemTitle,
  SheetListRow,
  SheetList,
} from '~/components/sheet'
import { P } from '~/components/p'
import { Container } from '~/components/Container'
import { SelectedChart } from '~/components/selected-chart'
import { MemoizedSalesPreviewByPage } from '~/components/sales-preview-by-page'
import {
  Selected,
  SelectedClose,
  SelectedPrice,
  SelectedQuantity,
  SelectedTitle,
} from '~/components/selected'
import { Shimmer } from '~/components/shimmer'
import { FilterPageOptions } from '~/components/filter-page-options'
import { Icon } from '~/components/icon'
import { LoadMoreButton } from '~/components/load-more-button'

import { currency } from '~/utils/currency'
import { COLORS } from '~/utils/colors'

import { useChart, useExpand, usePeriod, useVariant } from '~/hooks/use-filters'
import { useFetch } from '~/hooks/use-fetch'
import { useSelected } from '~/hooks/use-selected'
import { useSheet } from '~/hooks/use-sheet'

import { HEIGHT, WIDTH } from '~/utils/chart-size'

import { colors } from '~/styles/colors'
import { fonts } from '~/styles/fonts'

import type { IBranch, RankingBranchDTO } from '~/types/ranking-branch-dto'
import { VARIANT } from '~/constants/variant'

type BranchKeys =
  | 'firstOfDayDTOList'
  | 'firstOfMonthDTOList'
  | 'firstOfWeekDTOList'

export type Data = {
  DIA: { TOTAL: number; CHART: IBranch[] }
  SEMANA: { TOTAL: number; CHART: IBranch[] }
  MÊS: { TOTAL: number; CHART: IBranch[] }
}

const MonthPosition = 0

export default function Branch() {
  const sheetRef = useSheet()

  const { period } = usePeriod()
  const { selected, setSelected } = useSelected()
  const { chart } = useChart()
  const { expand } = useExpand()
  const { variant } = useVariant()

  const { data, isLoading, refetch } = useFetch<Data>(
    ['get-branch-ranking-query'],
    async (authorization, branch) => {
      const response = await api(`rankingfilial${branch}`, {
        headers: {
          'Content-Type': 'application/json',
          authorization,
        },
      })

      const json = (await response.json()) as RankingBranchDTO

      const { firstOfDayDTOList, firstOfMonthDTOList, firstOfWeekDTOList } =
        json

      const TOTAL = {
        MÊS: firstOfMonthDTOList.reduce(
          (acc, curr) => acc + curr[VARIANT[variant]],
          0,
        ),
        SEMANA: firstOfWeekDTOList.reduce(
          (acc, curr) => acc + curr[VARIANT[variant]],
          0,
        ),
        DIA: firstOfDayDTOList.reduce(
          (acc, curr) => acc + curr[VARIANT[variant]],
          0,
        ),
      }

      const CHART = Object.keys(json).map((item) =>
        json[item as BranchKeys].map((i, idx) => ({
          ...i,
          id: i.filial.id,
          posicao: `${i.posicao}°`,
          color: COLORS[idx],
          quantity: i.quantidadeTotal.toFixed(0),
          percentage: `${((i[VARIANT[variant]] / TOTAL[period]) * 100).toFixed(1)}%`, // acho que dá para tirar period daqui
        })),
      )

      return {
        DIA: { TOTAL: TOTAL.DIA, CHART: CHART[0] },
        SEMANA: { TOTAL: TOTAL.SEMANA, CHART: CHART[1] },
        MÊS: { TOTAL: TOTAL.MÊS, CHART: CHART[2] },
      }
    },
  )

  const DATA = data ? data[period] : null

  return (
    <Container>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            enabled={chart !== 'B. HORIZONTAL'}
          />
        }>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={s.header}>
          <Link href="/home/" asChild>
            <Pressable style={s.headerLeftContent}>
              <Icon name="arrow-back" size={16} />
              <P style={s.title}>Filiais</P>
            </Pressable>
          </Link>
        </View>

        <MemoizedSalesPreviewByPage
          bestSellerName={
            DATA ? DATA.CHART[MonthPosition].filial.nomeFantasia : ''
          }
          isLoading={isLoading}
          total={
            data ? [data.MÊS.TOTAL, data.SEMANA.TOTAL, data.DIA.TOTAL] : []
          }
        />

        <FilterPageOptions />

        {isLoading && (
          <Shimmer
            width={WIDTH - 40}
            height={HEIGHT - 600}
            style={s.chartLoading}
          />
        )}

        {DATA && (
          <>
            {DATA.CHART.length === 0 ? (
              <Chart.Empty />
            ) : (
              <View
                style={{
                  marginTop: chart === 'PIZZA' || chart === 'ROSCA' ? 64 : 0,
                }}>
                {DATA.CHART ? <SelectedChart data={DATA.CHART} /> : null}
              </View>
            )}
          </>
        )}

        <Sheet ref={sheetRef} index={!DATA ? 0 : selected || expand ? 4 : 1}>
          {selected ? (
            <Selected>
              <SelectedClose />

              <SelectedTitle>
                Em {selected?.posicao} lugar{' '}
                {selected?.filial.nomeFantasia?.toLowerCase()}
              </SelectedTitle>

              <SelectedPrice
                TOTAL={DATA ? DATA.TOTAL : 0}
                totalValue={selected?.valorTotal}
              />

              <SelectedQuantity
                TOTAL={DATA ? DATA.TOTAL : 0}
                totalQuantity={selected?.quantidadeTotal}
              />

              {/* <SelectedDetails
                href={`/details/vendamarca/codigoMarca=${selected?.id}/${selected?.filial.nomeFantasia}`}
              /> */}
            </Selected>
          ) : (
            <>
              <SheetHeader />

              <SheetList
                data={!DATA ? [] : DATA.CHART}
                keyExtractor={(item) => item.filial.nomeFantasia}
                ListFooterComponent={() =>
                  DATA
                    ? DATA.CHART.length === 20 && (
                        <LoadMoreButton isLoading={isLoading} />
                      )
                    : null
                }
                renderItem={({ item }) => (
                  <SheetListRow
                    onPress={() => setSelected(!selected ? item : null)}>
                    <SheetListItem
                      style={{ width: '20%', justifyContent: 'center' }}>
                      <SheetListColor color={item.color} />

                      <SheetListItemTitle>{item.posicao}</SheetListItemTitle>
                    </SheetListItem>

                    <SheetListItem style={{ width: '50%' }}>
                      <SheetListItemTitle>
                        {item.filial.nomeFantasia}
                      </SheetListItemTitle>
                    </SheetListItem>

                    <SheetListItem style={{ width: '30%' }}>
                      <SheetListItemTitle style={{ color: colors.green[500] }}>
                        {variant === 'QNT'
                          ? item.quantity
                          : `${currency(item.valorTotal)}`}
                        {'   '}
                        <P style={{ marginLeft: 4, color: '#71717a' }}>
                          {item.percentage}
                        </P>
                      </SheetListItemTitle>
                    </SheetListItem>
                  </SheetListRow>
                )}
              />
            </>
          )}
        </Sheet>
      </ScrollView>
    </Container>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts['urbanist-bold'],
  },
  goPageButton: {
    height: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goPageButtonText: {
    fontFamily: fonts['inter-semibold'],
    letterSpacing: -0.25,
    fontSize: 11,
  },
  button: {
    paddingVertical: 12,
  },
  buttonTitle: {
    fontSize: 10,
    lineHeight: 20,
    fontFamily: fonts['urbanist-bold'],
  },
  buttonPrice: {
    fontFamily: fonts['urbanist-bold'],
    fontSize: 14,
    letterSpacing: -0.25,
  },
  chartLoading: { marginHorizontal: 20, marginTop: 40 },
  headerLeftContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
})
