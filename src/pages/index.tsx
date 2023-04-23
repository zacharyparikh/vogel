import { SignInButton, useUser } from '@clerk/nextjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { type NextPage } from 'next';
import Image from 'next/image';
import { LoadingSpinner } from '~/components/loading-spinner';
import { api, type RouterOutputs } from '~/utils/api';

dayjs.extend(relativeTime);

const FeedHeader = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex w-full gap-3">
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
      />
    </div>
  );
};

type PostWithUser = RouterOutputs['posts']['getAll'][number];
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
      <Image
        src={profileImageUrl}
        alt={`${atUsername}'s profile`}
        height={60}
        width={60}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <span>{atUsername}</span>
          <span>·</span>
          <span className="font-thin">{dayjs(createdAt).fromNow()}</span>
        </div>
        <span className="text-2xl">{content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data: posts, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-grow flex-col justify-center self-center">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts?.map((postWithUser) => (
        <PostView key={postWithUser.post.id} postWithUser={postWithUser} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!isLoaded) {
    return <div />;
  }

  return (
    <main className="flex h-screen justify-center">
      <div className="flex w-full flex-col border-x border-slate-200 md:max-w-2xl">
        <div className="border-b border-slate-400 p-4">
          {isSignedIn ? <FeedHeader /> : <SignInButton />}
        </div>
        <Feed />
      </div>
    </main>
  );
};

export default Home;
