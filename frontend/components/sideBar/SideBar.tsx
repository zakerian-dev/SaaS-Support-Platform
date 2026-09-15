import Plan from "./Plan";
import Profile from "./Profile";
import RouteSelect from "./RouteSelect";

const SideBar = () => {
  return (
    <div className="lg:top-20 self-start w-full">
      <div className="lg:min-h-screen shadow-2xl p-4">
        <Profile />
        <div className="lg:sticky lg:top-5">
          <RouteSelect />
        </div>
        
      </div>
      <Plan />
    </div>
  );
};

export default SideBar;
