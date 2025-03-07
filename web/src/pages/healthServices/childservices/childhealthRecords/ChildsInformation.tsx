export default function ChildInfo() {
    return (
      <div className=" flex gap-4 justify-between ">
        {/* Child's Information */}
           {/* Mother's Information */}
           <section className="border-l-4 border-red-500 pl-4 bg-white rounded-lg shadow-sm py-3 w-full">
          <h2 className="flex items-center gap-2 text-lg font-medium text-red-400 mb-3">
            Childs's Information
          </h2>
          <div className="text-gray-700">
            <div className="flex flex-col">
              <span>Caballes, Katrina Shin D.</span>
              <span className="font-normal text-darkGray text-sm">70 yr. old</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>Date of Birth:</span>
                <span>12/32/23</span>
              </div>
            </div>
          </div>
        </section>
  
  
        {/* Mother's Information */}
        <section className="border-l-4 border-green-500 pl-4 bg-white rounded-lg shadow-sm py-3 w-full">
          <h2 className="flex items-center gap-2 text-lg font-medium text-green-600 mb-3">
            Mother's Information
          </h2>
          <div className="text-gray-700">
            <div className="flex flex-col">
              <span>Caballes, Katrina Shin D.</span>
              <span className="font-normal text-darkGray text-sm">70 yr. old</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>Occupation:</span>
                <span>Civil Engineer</span>
              </div>
            </div>
          </div>
        </section>
  
        {/* Father's Information */}
        <section className="border-l-4 border-indigo-400 pl-4 bg-white rounded-lg shadow-sm  py-3 w-full">
          <h2 className="flex items-center gap-2 text-lg font-medium text-indigo-800 mb-3">
            Father's Information
          </h2>
          <div className="text-gray-700">
            <div className="flex flex-col">
              <span>Caballes, Katrina Shin D.</span>
              <span className="font-normal text-darkGray text-sm">70 yr. old</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>Occupation:</span>
                <span>Civil Engineer</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }