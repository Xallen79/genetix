using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenetixEditor.Settings
{

    class Constants<T>
    {
        [JsonProperty("constants")]
        public T Config { get; set; }
    }
    class RootBuilding
    {
        [JsonProperty("defaultBuildings")]
        public Dictionary<string, BaseBuilding> Buildings { get; set; }
    }
    class RootResource
    {
        [JsonProperty("resourceTypes")]
        public Dictionary<string, BaseResource> ResourceTypes { get; set; }
    }

}
