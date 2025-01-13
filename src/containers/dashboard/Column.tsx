import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

import Card from './Card';
import ColumnSkeleton from './ColumnSkeleton';

import useFetchData from '@/hooks/useFetchData';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useModal from '@/hooks/useModal';
import { getCardsList, getComments } from '@/services/getService';
import { Card as CardType, CardsListResponse } from '@/types/Card.interface';
import { Column as ColumnType } from '@/types/Column.interface';

interface ColumnProps {
  column: ColumnType;
  columns: ColumnType[];
  index: number;
  isMember: boolean;
}

function Column({ column, columns, isMember }: ColumnProps) {
  const { openModifyColumnModal, openEditCardModal, openTodoCardModal } = useModal();
  const [cards, setCards] = useState<CardType[]>([]);
  const [cardsWithComments, setCardsWithComments] = useState<CardType[]>([]);
  const [cursorId, setCursorId] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const {
    data: initialData,
    isLoading,
    error,
  } = useFetchData<CardsListResponse>(['cards', column.id], () => getCardsList(column.id, 10));

  useEffect(() => {
    if (initialData) {
      setCards(initialData.cards);
      setCursorId(initialData.cursorId || null);
    }

    const fetchCommentsForCards = async () => {
      const cardsWithComments = await Promise.all(
        initialData?.cards?.map(async (card) => {
          const commentsData = await getComments(card.id);
          return { ...card, comments: commentsData.comments };
        }) ?? [],
      );
    };

    fetchCommentsForCards();
  }, [initialData]);

  const { observerRef } = useInfiniteScroll(cards, cursorId, isFetching);

  if (isLoading) {
    return <ColumnSkeleton />;
  }

  if (error) {
    return <>{error.message}</>;
  }

  return (
    <div className='block h-full lg:flex'>
      <div className='flex flex-col bg-gray-fa p-5 transition-colors lg:w-[354px] dark:bg-dark-bg'>
        {/* Column Header */}
        <div className='mb-[6px] flex cursor-default items-center justify-between'>
          <div className='flex items-center'>
            <span className='mr-[8px] text-xs text-violet'>𒊹</span>
            <h2 className='mr-[12px] text-lg font-bold text-black-33 dark:text-dark-10'>{column.title}</h2>
            <span className='flex size-[20px] items-center justify-center rounded-[6px] bg-gray-ee text-xs text-gray-78 dark:bg-dark-200 dark:text-dark-10'>
              {cards.length}
            </span>
          </div>

          {/* Column Edit Button */}
          <button
            className='transition duration-300 ease-in-out hover:rotate-90 disabled:rotate-0'
            disabled={!isMember}
            onClick={() => {
              openModifyColumnModal({ columns, columnId: column.id, columnTitle: column.title });
            }}
          >
            <Image src='/icons/gear.svg' width={24} height={24} alt='톱니바퀴 아이콘' />
          </button>
        </div>

        {/* Add Card Button */}
        <button
          className='btn-violet-light dark:btn-violet-dark mb-[16px] min-h-[40px] rounded-[6px] border'
          disabled={!isMember}
          onClick={() => {
            openEditCardModal({ column: column, isEdit: false });
          }}
        >
          <Image src='/icons/plus-filled.svg' width={22} height={22} alt='카드 추가 아이콘' className='dark:hidden' />
          <Image src='/icons/plus.svg' width={24} height={24} alt='카드 추가 아이콘' className='hidden dark:block' />
        </button>

        {/* Card List Section */}
        <div className='scrollbar-hide lg:overflow-y-auto'>
          <Droppable droppableId={`column-${column.id}`} key={`column-${column.id}`} isDropDisabled={!isMember}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ minHeight: '100px' }} // 최소 높이
              >
                {cards.map((card, index) => (
                  <Draggable
                    key={`card-${card.id}`}
                    draggableId={`card-${card.id}`}
                    index={index}
                    isDragDisabled={!isMember}
                  >
                    {(provided) => (
                      <div
                        ref={(cardRef) => {
                          provided.innerRef(cardRef);
                          if (index === cards.length - 1) observerRef.current = cardRef;
                        }}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => openTodoCardModal({ card, column, isMember })}
                      >
                        <Card key={`card-${card.id}`} card={card} comments={card.comments} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {isFetching &&
                  Array.from({ length: 1 }).map((_, index) => (
                    <div key={index} className='align-center py-3 opacity-50 invert dark:invert-0'>
                      <Image src='/icons/spinner.svg' alt='스피너 아이콘' width={20} height={20} />
                    </div>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>

      {/* Horizon Bar */}
      <hr className='h-full border-l border-gray-d9 dark:border-dark-200' />
    </div>
  );
}

export default Column;
