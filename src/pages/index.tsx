import { SignInButton, useUser } from '@clerk/nextjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '~/components/loading-spinner';
import { api, type RouterOutputs } from '~/utils/api';

dayjs.extend(relativeTime);

const FeedHeader = () => {
  const { user } = useUser();
  const [value, setValue] = useState('');
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess() {
      setValue('');
      ctx.post.getAll.invalidate().catch(() => {});
    },

    onError(error) {
      const message = error.data?.zodError?.fieldErrors.content;

      if (message && message[0]) {
        toast.error(message[0]);
        return;
      }

      toast.error('Failed to post! Please try again later.');
    },
  });

  if (!user) {
    return null;
  }

  const handlePost = () => {
    mutate({ content: value });
  };

  return (
    <div className="flex w-full items-center gap-3">
      <Image
        src={user.profileImageUrl}
        height={60}
        width={60}
        alt="Profile"
        className="rounded-full"
      />
      <input
        placeholder="What's Happening? 🦃 🐓 🦆"
        className="grow bg-transparent outline-none"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') {
            return;
          }

          event.preventDefault();

          if (value !== '') {
            handlePost();
          }
        }}
        disabled={isPosting}
      />
      {value !== '' && !isPosting && (
        <button type="button" onClick={handlePost}>
          Post
        </button>
      )}
      {isPosting && <LoadingSpinner size={20} />}
    </div>
  );
};

type PostWithUser = RouterOutputs['post']['getAll'][number];
type PostProps = { postWithUser: PostWithUser };
const PostView = ({
  postWithUser: {
    post: { id, content, createdAt },
    author: { username, profileImageUrl },
  },
}: PostProps) => {
  const atUsername = `@${username}`;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4" key={id}>
      <Link href={`/${username}`}>
        <Image
          src={profileImageUrl}
          alt={`${atUsername}'s profile`}
          height={60}
          width={60}
          className="rounded-full"
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/${username}`}>{atUsername}</Link>
          <Link href={`/post/${id}`}>
            <span> · </span>
            <span className="font-thin">{dayjs(createdAt).fromNow()}</span>
          </Link>
        </div>
        <Link href={`/post/${id}`}>
          <span className="text-2xl">{content}</span>
        </Link>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-grow flex-col justify-center self-center">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {posts?.map((postWithUser) => (
        <PostView key={postWithUser.post.id} postWithUser={postWithUser} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  api.post.getAll.useQuery();

  if (!isLoaded) {
    return <div />;
  }

  return (
    <main className="flex h-screen justify-center">
      <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
        <div className="border-b border-slate-400 p-4">
          {isSignedIn ? <FeedHeader /> : <SignInButton />}
        </div>
        <Feed />
      </div>
    </main>
  );
};

export default Home;
